#!/bin/bash

echo "🔄 Restarting Backend Server..."
lsof -ti:4000 | xargs kill -9 2>/dev/null || true
sleep 2

cd /Users/bhaweshganesh/Desktop/fyp/backend
node index.js > /tmp/backend-khalti.log 2>&1 &

sleep 3
echo ""
echo "✅ Backend restarted!"
echo "📋 Backend logs:"
tail -10 /tmp/backend-khalti.log
echo ""
echo "🎯 Now restart your FRONTEND in its terminal:"
echo "   1. Press Ctrl+C to stop"
echo "   2. Run: npm run dev"
echo ""
echo "📝 Don't forget to edit the .env files with your Khalti keys!"
