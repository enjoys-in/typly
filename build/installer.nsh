; Custom NSIS steps for the Typly assisted installer.
; Hooked by electron-builder via the nsis.include option.

; Adds a Welcome page as the first step of the wizard.
!macro customWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Welcome to the Typly Setup Wizard"
  !define MUI_WELCOMEPAGE_TEXT "Typly is offline-first typing-exam practice for Indian competitive exams, built for students.$\r$\n$\r$\nDesigned and developed by enjoys.in — a professional app development studio crafting fast, reliable software.$\r$\n$\r$\nOpen source & more at github.com/enjoys-in.$\r$\n$\r$\nClick Next to continue."
  !insertmacro MUI_PAGE_WELCOME
!macroend

!macro customInstall
  ; Open the Typly website once, only on a fresh install (not on updates).
  ${ifNot} ${isUpdated}
    ExecShell "open" "https://enjoys.in"
  ${endIf}
!macroend
