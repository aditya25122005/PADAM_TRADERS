const mongoose= require('mongoose');
const Product= require('./models/Product');
const products = [
  {
    name: "Cold-Pressed Mustard Oil",
    img: "https://lh3.googleusercontent.com/gg-dl/AJfQ9KRY6_VKYRXkaB8LgMPsUN5f635E7gYYO4EDHAMuCVFfJmuCwlMKM4vLNKhUOh-5pvDV-4GC8qtiXF938WVXIg_IpFnQzAJEXgeSyT4gU7Lx4aIVaulI6TkJEnbKDKtATzVwsWmKo2S66a1v_0hPba_ecwkYKNu2_kDQAl0JbgRpkPmAkw=s1024",
    price: 150,
    quantity: "500 ml",
    desc: "Pure cold-pressed mustard oil, rich in nutrients and flavor.",
    stock: 50
  },
  {
    name: "Cold-Pressed Mustard Oil",
    img: "https://example.com/images/coldpressed-1l.jpg",
    price: 280,
    quantity: "1 L",
    desc: "Premium cold-pressed mustard oil, perfect for daily cooking.",
    stock: 40
  },
  {
    name: "Refined Mustard Oil",
    img: "https://example.com/images/refined-1l.jpg",
    price: 250,
    quantity: "1 L",
    desc: "Light taste, longer shelf life, suitable for all cooking purposes.",
    stock: 60
  },
  {
    name: "Organic Mustard Oil",
    img: "https://example.com/images/organic-500ml.jpg",
    price: 200,
    quantity: "500 ml",
    desc: "Certified organic mustard oil, chemical-free, for healthy cooking.",
    stock: 30
  },
  {
    name: "Filtered Mustard Oil",
    img: "https://example.com/images/filtered-5l.jpg",
    price: 1200,
    quantity: "5 L",
    desc: "Pure filtered mustard oil, ideal for bulk cooking and restaurants.",
    stock: 20
  }
];
async function seedDB(){
await Product.insertMany(products);
console.log("DATA SEEDED SUCCESSFULLY");
}

module.exports=seedDB;
