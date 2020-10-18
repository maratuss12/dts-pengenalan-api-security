import mongoose from 'mongoose'

const kasirSchema = mongoose.Schema(
{
    karyawanId: {
        type: String,
    },
    jabatan: {
        type: String,
    },
    transaksi: {
        type: String,
        required: true,
    },
    nominal: {
        type: Number,
    },
    saldoTotal: {
        type: Number,
    }
},
{
    timestamps: true,
});

const Kasir = mongoose.model('Kasir', kasirSchema);

export default Kasir;