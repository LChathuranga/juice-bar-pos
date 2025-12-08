!macro customUnInstall
  ; Remove the application data folder (contains database and product images)
  RMDir /r "$APPDATA\${APP_FILENAME}"
  
  ; Also try the product name folder in case it's different
  RMDir /r "$APPDATA\juice-bar-pos"
!macroend
