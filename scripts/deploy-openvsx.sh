export $(cat .env | xargs)
echo "Publishing using ${OPEN_VSX}"
npx ovsx publish -p "${OPEN_VSX}"
