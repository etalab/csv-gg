. "/usr/local/opt/nvm/nvm.sh" && nvm use
npm run build-production
rm -rf docs
mv dist docs
echo forms.validata.etalab.studio > docs/CNAME
git add docs
git commit docs -m 'auto-build vue app'
