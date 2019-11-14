const express = require("express"); // import express in this module
const router = new express.Router(); // create an app sub-module (router)

//require sneaker model
const sneakerModel = require("./../models/Sneaker");
// const tagModel = require("./../models/Tag");

module.exports = router;

//function to find min max values for the filter

function findMinMax(dbRes, filterBy, mi, ma) {
  let minMax = { min: mi, max: ma };
  dbRes.forEach(element => {
    element[filterBy].forEach(a => {
      if (Number(a) != NaN) {
        if (Number(a) < minMax.min) {
          minMax.min = Number(a);
        }
        if (Number(a) > minMax.max) {
          minMax.max = Number(a);
        }
      }
    });
  });
  return minMax;
}

//public routes

// setup http://localhost:8080/sneakers/collection

router.get("/sneakers/collection", (req, res) => {
  sneakerModel
    .find()
    .then(dbRes => {
      min = findMinMax(dbRes, "sizes", 20, 40).min;
      max = findMinMax(dbRes, "sizes", 20, 40).max;

      res.render("products", {
        sneakers: dbRes,
        category: "collection",
        scripts: ["client.js"],
        min: min,
        max: max
      });
    })
    .catch(dbErr => console.log(dbErr));
});

// setup http://localhost:8080/sneakers/men

router.get("/sneakers/men", (req, res) => {
  sneakerModel
    .find({ category: "men" })
    .then(dbRes => {
      res.render("products", { sneakers: dbRes, category: "men" });
    })
    .catch(dbErr => console.log(dbErr));
});

// setup http://localhost:8080/sneakers/women

router.get("/sneakers/women", (req, res) => {
  sneakerModel
    .find({ category: "women" })
    .then(dbRes => {
      res.render("products", { sneakers: dbRes, category: "women" });
    })
    .catch(dbErr => console.log(dbErr));
});

// setup http://localhost:8080/sneakers/kids

router.get("/sneakers/kids", (req, res) => {
  sneakerModel
    .find({ category: "kids" })
    .then(dbRes => {
      res.render("products", { sneakers: dbRes, category: "kids" });
    })
    .catch(dbErr => console.log(dbErr));
});

//display one product

router.get("/one-product/:id", (req, res) => {
  sneakerModel
    .findOne({ _id: req.params.id })
    .then(dbRes => {
      res.render("one_product", { sneaker: dbRes });
    })
    .catch(dbErr => console.log(dbErr));
});

//protected routes

//protected route middleware

function protectAdminRoute(req, res, next) {
  // const isAuthorized = true;
  // console.log(req.session.currentUser)
  const isAuthorized = req.session.currentUser;
  if (isAuthorized) {
    res.locals.isAdmin = true;
    // we write in res.locals here (accessible everywhere in hbs templates)
    // logic before the next() call ...
    next(); // executes the next middleware in line OR the callback handling the request if this is the last middleware in line
  } else {
    res.locals.isAdmin = false;
    res.redirect("/signin");
  }
}

//manage sneakers

router.get("/prod-manage", protectAdminRoute, (req, res, next) => {
  sneakerModel.find().then(dbRes => {
    res.render("products_manage", { sneakers: dbRes });
  });
});

router.get("/prod-add", protectAdminRoute, (req, res, next) => {
  res.render("products_add");
});

router.get("/product-edit/:id", protectAdminRoute, (req, res, next) => {
  sneakerModel
    .findById(req.params.id)
    .then(dbRes => {
      res.render("product_edit", {
        sneaker: dbRes
      });
    })
    .catch(err => console.log(err));
});

router.post("/product-edit/:id", protectAdminRoute, (req, res, next) => {
  sneakerModel
    .findByIdAndUpdate(req.params.id, req.body)
    .then(dbRes => {
      res.redirect("/prod-manage");
    })
    .catch(dbErr => {
      console.log(dbErr);
    });
});
