# countries-api
How to set up:
    1- clone the project anywhere.
    2- create a .env file in the project directory.
    3- make sure you have a live mysql database
    4- define these 4:
        DATABASE_USERNAME="your db username"
        DATABASE_PASSWORD="your db password"
        DATABASE_PORT="your db port"
        DATABASE_NAME="A database name, doesn't have to be created"
        DATABASE_HOST="your db host"
    5- run the command npm i in the project directory
    6- run the command node .\app.js
congrats, the project is live

API list :
    GET:
        1- localhost:3000/api/countries?name=optional&cca2=optional&cca3=optional&ccn3=optional
        2- localhost:3000/api/countries/:cca2
        3- localhost:3000/api/countries/byRegion
        4- localhost:3000/api/countries/byLanguage
        5- localhost:3000/api/countries/json  --header x-admin needs to be 1 otherwize you'll get an error
    POST
        1- localhost:3000/api/countries you don't need a body, this will seed itself from this URL:
'01101100 01101100 01100001 00101111 00110001 00101110 00110011 01110110 00101111 01101101 01101111 01100011 00101110 01110011 01100101 01101001 01110010 01110100 01101110 01110101 01101111 01100011 01110100 01110011 01100101 01110010 00101111 00101111 00111010 01110011 01110000 01110100 01110100 01101000'