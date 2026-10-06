$ErrorActionPreference = 'Stop'
$sourcePath = (Resolve-Path 'output\Universal_Review_Mining_SLA_Stage_3_Report.docx').Path
$pdfPath = Join-Path (Resolve-Path 'output').Path 'Universal_Review_Mining_SLA_Stage_3_Report.pdf'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    $doc = $word.Documents.Open($sourcePath)
    $doc.ExportAsFixedFormat($pdfPath, 17)
    $doc.Close(0)
}
finally {
    $word.Quit()
}
if (-not (Test-Path -LiteralPath $pdfPath)) {
    throw "Word did not create the expected PDF: $pdfPath"
}
Get-Item -LiteralPath $pdfPath | Select-Object FullName, Length
