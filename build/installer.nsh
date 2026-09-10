; Only the helper executable blocks installation. Directory-prefix matching
; can mistake Setup or an unrelated executable for the installed application.
; Never force-kill the helper: it may be committing a theme transaction.
!macro customCheckAppRunning
  !define /redef SNORCA_CHECK_ID ${__LINE__}
  snorca_check_${SNORCA_CHECK_ID}:
    nsProcess::_FindProcess /NOUNLOAD "${APP_EXECUTABLE_FILENAME}"
    Pop $R0
    ${If} $R0 == 603
      Goto snorca_clear_${SNORCA_CHECK_ID}
    ${EndIf}
    ${If} $R0 == 0
      MessageBox MB_RETRYCANCEL|MB_ICONEXCLAMATION "Close Snorca After Dark, then click Retry. If a theme change is in progress, let it finish first." /SD IDCANCEL IDRETRY snorca_check_${SNORCA_CHECK_ID}
    ${Else}
      MessageBox MB_RETRYCANCEL|MB_ICONEXCLAMATION "Setup could not check whether Snorca After Dark is open (code $R0). Click Retry to check again, or Cancel to leave the installation unchanged." /SD IDCANCEL IDRETRY snorca_check_${SNORCA_CHECK_ID}
    ${EndIf}
    SetErrorLevel 2
    Quit
  snorca_clear_${SNORCA_CHECK_ID}:
    nsProcess::_Unload
  !undef SNORCA_CHECK_ID
!macroend

; Keep the Windows Installed Apps entry and expose removal in the Start menu.
!macro customInstall
  CreateShortcut "$SMPROGRAMS\Uninstall Snorca After Dark.lnk" "$INSTDIR\${UNINSTALL_FILENAME}"
!macroend
!macro customUnInstall
  Delete "$SMPROGRAMS\Uninstall Snorca After Dark.lnk"
!macroend
