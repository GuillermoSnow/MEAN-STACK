const crypto = require('crypto').randomBytes(256).toString('hex');

module.exports=
{
    uri: 'mongodb://guillermo:CALLOFDUTy4.@ds159997.mlab.com:59997/angular-2-app',
    secret: crypto,
    db: 'mean-angular-2'
}