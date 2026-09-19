@echo off
cd /d E:\MY\HTML\givera-website
git pull --rebase origin main
git add .
git commit -m "更新 %date% %time%"
git push
echo.
echo 部署完成！等 1-2 分钟 Cloudflare 自动更新。
pause