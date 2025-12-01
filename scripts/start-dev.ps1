# Start development services: backend and docker DB
Write-Output "Starting Docker DB services..."
docker-compose up -d

# By default start the backend as a background PowerShell job so it keeps running
# after the task completes and you can close the task terminal if you want.
# To run in foreground, set the environment variable FOREGROUND=1 before running this script.
if ($env:FOREGROUND -eq '1') {
	Write-Output "Starting backend in foreground (nodemon)..."
	Push-Location -Path (Join-Path $PSScriptRoot '..' 'backend')
	npm run dev
	Pop-Location
} else {
	Write-Output "Starting backend as a background job (nodemon)..."
	# Resolve backend path robustly
	$backendPath = Join-Path $PSScriptRoot '..\backend'
	$backendPath = (Resolve-Path -Path $backendPath).ProviderPath
	$logPath = Join-Path $backendPath 'dev.log'
	$job = Start-Job -Name "freemart-backend" -ScriptBlock {
		param($path,$log)
		Set-Location -Path $path
		# Run nodemon and append stdout/stderr to log
		npm run dev *>&1 | Out-File -FilePath $log -Append
	} -ArgumentList $backendPath,$logPath
	Write-Output "Backend job started (Id=$($job.Id)). Logs will be appended to $logPath"
}
