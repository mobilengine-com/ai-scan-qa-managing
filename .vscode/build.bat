:START
@ECHO OFF
::TODO: �rtelemszer�en add meg a k�nyvt�rakat ahol n�lad tal�lhat� a mebt / solution / server / user / pwd
set mebtPath=C:\Users\daniel.dauda\Desktop\munkak\Mobilengine\V24\Mebt_49.12.259.59a385d_Debug
set solutionPath=C:\Users\daniel.dauda\Documents\GitHub\ai-scan-qa-managing
set mebtExe=%mebtPath%\Mebt.exe
set server=https://scanbauapp-outdoor.mobilengine.com/services/comex
set user=dev_102
set pwd=-T3gl4f4l-
set cid=102

set startTime=%Time%
ECHO %solutionPath%
s
ECHO %startTime% Build Started...

@ECHO ON
"%mebtExe%" run -s %server% --skip-assign -u %user% -p %pwd% -c %cid% "%solutionPath%" 
@ECHO OFF

ECHO %startTime% Build Started...
ECHO %Time% Build Finished... 

IF %ERRORLEVEL% NEQ 0 GOTO :ERROR
:ERROR
