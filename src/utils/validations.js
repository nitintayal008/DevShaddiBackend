 import validator from 'validator';

export const validateSignUpData = (req)=>{
    const { firstName, lastName, emailId, password} = req.body;
    if(!firstName || !lastName){
        throw new Error("First name and last name are required");
    } 
    if(!validator.isEmail(emailId)){
        throw new Error("Invalid email format");
    }
}

export const validateProfileEditData = (req) => {
  const allowedFields = ["firstName", "lastName", "about", "photoUrl", "skills"];
  const keys = Object.keys(req.body);

  const isEditAllowed = keys.every(field => allowedFields.includes(field));
  console.log("Allowed edit check:", isEditAllowed, "Fields:", keys);

  return isEditAllowed;
};



