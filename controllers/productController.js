const Product = require("../models/Product");
const Firm = require("../models/Firm");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// ================= ADD PRODUCT =================
const addProduct = async (req, res) => {
    try {
        const { productName, price, category, bestseller, description } = req.body;
        const image = req.file ? req.file.filename : null;

        // ✅ Clean & validate firmId
        const firmId = req.params.firmId?.trim();

        if (!mongoose.Types.ObjectId.isValid(firmId)) {
            return res.status(400).json({
                error: "Invalid firmId",
                received: firmId
            });
        }

        // ✅ Find firm
        const firm = await Firm.findById(firmId);
        if (!firm) {
            return res.status(404).json({ error: "Firm not found" });
        }

        // ✅ Ensure products array exists
        if (!Array.isArray(firm.products)) {
            firm.products = [];
        }

        // ✅ Create product
        const product = new Product({
            productName,
            price,
            category,
            bestseller,
            description,
            image,
            firm: firm._id
        });

        // ✅ Save product correctly
        const savedProduct = await product.save();

        // ✅ Push ONLY ObjectId
        firm.products.push(savedProduct._id);
        await firm.save();

        return res.status(201).json({
            message: "Product added successfully",
            product: savedProduct
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


const getProductByFirm = async(req,res)=>{
    try {
            const firmId = req.params.firmId;
            const firm = await Firm.findById(firmId);

            if(!firm){
                return res.status(404).json({error: "No firm found"});
            }
            const restuarantName = firm.firmName;
            const products = await Product.find({firm: firmId});

            res.status(200).json({restuarantName, products});
    } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
    }
}


const deleteProductById = async(req,res)=>{
    try {
            const productId = req.params.productId;

            const deletedProduct = await Product.findByIdAndDelete(productId);

            if(!deleteddProduct){
                return res(404).json({error: "no product found"})
            }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
// ================= EXPORT =================
module.exports = {
    addProduct: [upload.single("image"), addProduct],getProductByFirm, deleteProductById };
