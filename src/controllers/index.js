const connection = require("../db/connection");

const index = async (req, res) => {
  try {
       var query = 'SELECT * from users'
       connection.query(query, (error, result) => {
        if (error) {
            res.status(404).json({
                message: 'Error ejecutando la query',
                error: `${error}`
            })
        } else {
           res.render("index", {
             title: "Inicio",
             message: 'Hola Mundo',
             enterprise: 'APD'
           });
        }
       })

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
