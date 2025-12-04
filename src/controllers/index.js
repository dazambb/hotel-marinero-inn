const connection = require("../db/connection");

const index = async (req, res) => {
  try {
    res.render("index", {
      title: "Inicio",
      description: "Hotel Marinero Inn - Hotel frente al mar en la costa ecuatoriana con discoteca, restaurante, bar, piscina y habitaciones de lujo",
      keywords: "hotel ecuador, hotel playa, hotel costa ecuatoriana, marinero inn"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error,
    });
  }
};

module.exports = {
  index: index,
};
