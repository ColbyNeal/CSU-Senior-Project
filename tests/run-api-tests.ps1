# CSCI 498 Senior Project - API Test Runner
# Run from PowerShell while the application is running:
#   .\tests\run-api-tests.ps1
#
# Default base URL: http://localhost:3000
# Optional:
#   .\tests\run-api-tests.ps1 -BaseUrl "http://localhost:3000"

param(
    [string]$BaseUrl = "http://localhost:3000"
)

$ErrorActionPreference = "Stop"
$script:Passed = 0
$script:Failed = 0
$script:Results = @()

function Invoke-ApiRequest {
    param(
        [Parameter(Mandatory = $true)][string]$Uri,
        [string]$Method = "GET"
    )

    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $Uri -Method $Method
        return [pscustomobject]@{
            StatusCode = [int]$response.StatusCode
            BodyText   = [string]$response.Content
            Json       = ($response.Content | ConvertFrom-Json)
        }
    }
    catch {
        $statusCode = 0
        if ($null -ne $_.Exception.Response) {
            try {
                $statusCode = [int]$_.Exception.Response.StatusCode
            }
            catch {
                $statusCode = 0
            }
        }

        $bodyText = ""
        if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
            $bodyText = [string]$_.ErrorDetails.Message
        }

        $json = $null
        if ($bodyText) {
            try { $json = $bodyText | ConvertFrom-Json } catch { }
        }

        return [pscustomobject]@{
            StatusCode = $statusCode
            BodyText   = $bodyText
            Json       = $json
        }
    }
}

function Record-Test {
    param(
        [string]$Id,
        [string]$Name,
        [scriptblock]$Test
    )

    try {
        $detail = & $Test
        $script:Passed++
        $script:Results += [pscustomobject]@{
            TestID = $Id
            Test   = $Name
            Result = "PASS"
            Detail = [string]$detail
        }
        Write-Host ("[PASS] {0} - {1}: {2}" -f $Id, $Name, $detail) -ForegroundColor Green
    }
    catch {
        $script:Failed++
        $script:Results += [pscustomobject]@{
            TestID = $Id
            Test   = $Name
            Result = "FAIL"
            Detail = $_.Exception.Message
        }
        Write-Host ("[FAIL] {0} - {1}: {2}" -f $Id, $Name, $_.Exception.Message) -ForegroundColor Red
    }
}

function Assert-Equal {
    param($Actual, $Expected, [string]$Message)
    if ($Actual -ne $Expected) {
        throw "$Message Expected '$Expected'; got '$Actual'."
    }
}

function Assert-True {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw $Message }
}

Write-Host ""
Write-Host "CSCI 498 Senior Project API Tests" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl"
Write-Host "Make sure the app/backend is running before starting."
Write-Host ""

Record-Test "BLS-EXEC-001" "Valid BLS series request" {
    $r = Invoke-ApiRequest -Uri "$BaseUrl/api/bls/latest?seriesId=CUUR0000SA0"
    Assert-Equal $r.StatusCode 200 "Valid BLS request should return HTTP 200."
    Assert-True ($r.Json.success -eq $true) "Response success should be true."
    Assert-True ($null -ne $r.Json.series) "Response should include a series object."
    return "HTTP 200; success=true; series object returned"
}

Record-Test "BLS-EXEC-002" "Latest BLS observation has data" {
    $r = Invoke-ApiRequest -Uri "$BaseUrl/api/bls/latest?seriesId=CUUR0000SA0"
    Assert-Equal $r.StatusCode 200 "BLS request should return HTTP 200."
    Assert-True ($r.Json.series.data.Count -gt 0) "Series should contain at least one observation."
    $latest = $r.Json.series.data[0]
    Assert-True (-not [string]::IsNullOrWhiteSpace([string]$latest.value)) "Latest observation should have a value."
    return ("Latest observation: year={0}, period={1}, value={2}" -f $latest.year, $latest.period, $latest.value)
}

Record-Test "BLS-EXEC-005" "Missing BLS seriesId is rejected" {
    $r = Invoke-ApiRequest -Uri "$BaseUrl/api/bls/latest"
    Assert-Equal $r.StatusCode 400 "Missing seriesId should return HTTP 400."
    Assert-Equal $r.Json.error "A BLS seriesId is required." "Unexpected validation message."
    return "HTTP 400; expected validation message"
}

Record-Test "BLS-EXEC-004" "Invalid BLS series is rejected" {
    $r = Invoke-ApiRequest -Uri "$BaseUrl/api/bls/latest?seriesId=INVALID_SERIES_123"
    Assert-Equal $r.StatusCode 500 "Invalid series should return HTTP 500 with current implementation."
    Assert-True ($r.Json.success -eq $false) "Invalid series should not report success."
    return "HTTP 500; success=false"
}

Record-Test "CAREER-EXEC-001" "Career list endpoint returns careers" {
    $r = Invoke-ApiRequest -Uri "$BaseUrl/api/careers"
    Assert-Equal $r.StatusCode 200 "Career list should return HTTP 200."
    Assert-True ($r.Json.success -eq $true) "Career list success should be true."
    $items = $r.Json.careers
    if ($null -eq $items) { $items = $r.Json.data }
    Assert-True ($null -ne $items -and $items.Count -gt 0) "Career list should contain at least one career."
    return ("HTTP 200; {0} career record(s) returned" -f $items.Count)
}

Record-Test "BLS-EXEC-006" "Career details include stored BLS snapshot" {
    $r = Invoke-ApiRequest -Uri "$BaseUrl/api/careers/details?socCode=13-2011"
    Assert-Equal $r.StatusCode 200 "Known SOC code should return HTTP 200."
    Assert-True ($r.Json.success -eq $true) "Career details success should be true."
    Assert-Equal $r.Json.career.soc_code "13-2011" "Unexpected SOC code."
    Assert-True (-not [string]::IsNullOrWhiteSpace([string]$r.Json.career.title)) "Career title should be populated."
    return "HTTP 200; Accountant career details returned"
}

Record-Test "BLS-EXEC-007" "Unknown SOC code returns not found" {
    $r = Invoke-ApiRequest -Uri "$BaseUrl/api/careers/details?socCode=99-9999"
    Assert-Equal $r.StatusCode 404 "Unknown SOC code should return HTTP 404."
    Assert-Equal $r.Json.error "Career not found." "Unexpected not-found message."
    return "HTTP 404; expected not-found message"
}

Record-Test "BLS-EXEC-008" "Missing socCode is rejected" {
    $r = Invoke-ApiRequest -Uri "$BaseUrl/api/careers/details"
    Assert-Equal $r.StatusCode 400 "Missing socCode should return HTTP 400."
    Assert-Equal $r.Json.error "A socCode is required." "Unexpected validation message."
    return "HTTP 400; expected validation message"
}

Record-Test "BLS-EXEC-009" "POST method is rejected by career-details endpoint" {
    $r = Invoke-ApiRequest -Uri "$BaseUrl/api/careers/details?socCode=13-2011" -Method "POST"
    Assert-Equal $r.StatusCode 405 "POST should return HTTP 405."
    Assert-Equal $r.Json.error "Method not allowed." "Unexpected method-not-allowed message."
    return "HTTP 405; expected method-not-allowed message"
}

Write-Host ""
Write-Host "Summary" -ForegroundColor Cyan
Write-Host ("Passed: {0}" -f $script:Passed) -ForegroundColor Green
Write-Host ("Failed: {0}" -f $script:Failed) -ForegroundColor $(if ($script:Failed -gt 0) { "Red" } else { "Green" })

$resultsPath = Join-Path (Get-Location) "api-test-results.csv"
$script:Results | Export-Csv -Path $resultsPath -NoTypeInformation
Write-Host "Detailed results saved to: $resultsPath"

if ($script:Failed -gt 0) {
    exit 1
}
exit 0
