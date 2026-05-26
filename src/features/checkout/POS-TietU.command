# Tạo file
echo '#!/bin/bash
open -a "Google Chrome" --args --kiosk-printing "http://localhost:3000"' > ~/Desktop/POS-TietU.command

# Cấp quyền chạy
chmod +x ~/Desktop/POS-TietU.command
