import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    profilePic: {
        type: String,
        default: "",
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'owner'],
        default: 'user'
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    banUntil: {
      type: Date,
      default: null
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    lockUntil: {
      type: Date,
      default: null
    },
    lockReason: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ['Active', 'Banned', 'Locked'],
      default: 'Active'
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;