#!/bin/sh
set -e

# à¹€à¸žà¸´à¹ˆà¸¡ .catch à¹€à¸žà¸·à¹ˆà¸­à¸¥à¸š unhandled rejection à¹à¸¥à¸°à¹à¸ªà¸”à¸‡ log à¸Šà¸±à¸”à¹€à¸ˆà¸™
node -e '
  import("/app/initadmin.js")
    .then(m => {
        return m.initadmin(
            process.env.ADMIN_USERNAME, 
            process.env.ADMIN_EMAIL, 
            process.env.ADMIN_PASSWORD, 
            process.env.ADMIN_PHONE
        );
    })
    .then(() => {
        console.log("InitAdmin completed successfully.");
        process.exit(0); // à¸ªà¸³à¸„à¸±à¸à¸¡à¸²à¸! à¸šà¸±à¸‡à¸„à¸±à¸šà¸ˆà¸š process à¹€à¸¡à¸·à¹ˆà¸­à¸ªà¸³à¹€à¸£à¹‡à¸ˆ
    })
    .catch(err => { 
        console.error("InitAdmin Error:", err); 
        process.exit(0); // à¸ˆà¸š process à¸”à¹‰à¸§à¸¢ 0 à¹€à¸žà¸·à¹ˆà¸­à¹ƒà¸«à¹‰ container à¸£à¸±à¸™à¸•à¹ˆà¸­à¹„à¸”à¹‰à¹à¸¡à¹‰à¹€à¸ˆà¸­ error
    })
'

exec npm start