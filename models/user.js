import mongoose from 'mongoose'

const userSchema = mongoose.Schema(
{
    username: {
        type: String,
        required: true,
    },
    namaBelakang: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    jabatan: {
        type: String,
        required: true,
    }
},
{
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User;