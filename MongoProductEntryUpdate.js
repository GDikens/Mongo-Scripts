var fs = require('fs');
const exec = require('child_process').exec;

var tenant_replacement = 'var tenant = ';
var path_replacement = 'var path = ';

console.log("=========================================================");
console.log("Author : Dineth Kariyawasam");
console.log("Version : 1.0");
console.log("Date : " + getCurrentDate());
console.log("Time : " + getCurrentTime());
console.log("=========================================================");

if(process.argv[2] && process.argv.length == 3){

    tenant_replacement += '\"' + process.argv[2] + '\"';

    fs.readFile('UpdateProductEntryByTenant.js', 'utf8', function (err,data) {

        if (err) {
    
            return console.log(err);
    
        }
        
        var result = data.replace(/var tenant = "([^"]|"")*"/g, tenant_replacement );
        
        fs.writeFile('UpdateProductEntryByTenant.js', result, 'utf8', function (err) {
            
            if (err) return console.log(err);
    
        });
    
    });

    const child = exec('mongo UpdateProductEntryByTenant.js', (error, stdout, stderr) => {
        
        if (error !== null) {
            console.log(`exec error: ${error}`);
        }

    });
    

} else if(process.argv[2] && process.argv[3] && process.argv.length == 4){

    tenant_replacement += '\"' + process.argv[2] + '\"';
    path_replacement += '\"' + process.argv[3] + '\"';

    fs.readFile('UpdateProductEntryByTenantAndFieldPath.js', 'utf8', function (err,data) {

        if (err) {
    
            return console.log(err);
    
        }
        
        var tenant_result = data.replace(/var tenant = "([^"]|"")*"/g, tenant_replacement );
        var path_result = data.replace(/var path = "([^"]|"")*"/g, path_replacement );
        
        fs.writeFile('UpdateProductEntryByTenantAndFieldPath.js', tenant_result, 'utf8', function (err) {
            
            if (err) return console.log(err);
    
        });

        fs.writeFile('UpdateProductEntryByTenantAndFieldPath.js', path_result, 'utf8', function (err) {
            
            if (err) return console.log(err);
    
        });
    
    });

    const child = exec('mongo UpdateProductEntryByTenantAndFieldPath.js', (error, stdout, stderr) => {
        
        if (error !== null) {
            console.log(`exec error: ${error}`);
        }

    });

} else if(process.argv.length > 3){

    console.log("Error : Only one argument required!");

}

function getCurrentDate(){

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd = '0'+dd
    } 

    if(mm<10) {
        mm = '0'+mm
    } 

    return today = mm + '/' + dd + '/' + yyyy;

}

function getCurrentTime(){

    var d = new Date();

    return time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
}








