const formidable = require('formidable');
const fs = require('fs')

module.exports = (req,prefix,isAvatar=0) => {
  return new Promise((resolve,reject) => { 
    formidable().parse(req, async (err, fields, files) => {
      if (err) 
        return reject(new Error(err));
      if (files.file){
        
        if (files.file.size == 0)
          return resolve() //ko upload gi ca
        
        const oldpath = files.file.path
        if (isAvatar)
          files.file.name = '0.jpg'
        const newpath = `./public/images/${prefix}${files.file.name}`
        
        try {
          await new Promise((reso1,reje1) => {
            fs.rename(oldpath, newpath, (err) => {
              if (err)
                return reje1(err)
              reso1()
            })
          })
        } catch(x) {
           return reject(new Error(x))
        }
        return resolve(newpath)
      }
      
      reject(new Error('Nothing?'))
    })
  })
}