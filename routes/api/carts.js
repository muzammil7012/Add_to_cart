// routes/api/users.js
const express = require("express");
const router = express.Router();

//Models needed
const Book = require("../../models/book");
const Cart = require("../../models/cart");
const User = require("../../models/user");

// @route   POST api/carts/create
// @desc    Create a cart
// @access  Public
router.post("/create/:id", async (req, res) => {
  let findUserCart = await Cart.findOne({ user: req.params.id });
  if (findUserCart) {
    await Cart.findOneAndUpdate(
      { user: req.params.id },
      { items: [...findUserCart.items, req.body] },
      (error, data) => {
        if (error) {
          res
            .status(400)
            .json({ msg: "Some Error Occured to Add New Item", error });
        } else {
          res.status(200).json({ msg: "New Item Add SuccessFully" });
        }
      }
    );
  } else {
    let cart = new Cart();
    cart.user = req.params.id;
    cart.items = [req.body];
    cart
      .save()
      .then((cart) => res.json({ msg: "New Item Add SuccessFully" }))
      .catch((err) =>
        res.status(404).json({ msg: "Sorry! Cart could not be created", err })
      );
  }
});

// @route   GET api/carts/Get
// @desc    specific user cart
// @access  Public
router.get("/getCartItem/:id", async (req, res) => {
  let userCart = await Cart.findOne({ user: req.params.id });
  if (userCart) {
    var subTotal = 0;
    userCart.items.forEach((item) => {
      subTotal = subTotal + item.price;
    });
    res
      .status(200)
      .json({ msg: "Cart Items are", userCart, subTotal: subTotal });
  }
});

// @route   Update api/carts/PUT
// @desc    Update Item In Cart
// @access  Public
router.put("/updateCartItem/:id", async (req, res) => {
  let findItemInCart = await Cart.findOne({ user: req.params.id });
  if (findItemInCart) {
    let itemIndex = findItemInCart.items.findIndex(
      (item) => item.bookName == req.body.bookName
    );
    findItemInCart.items[itemIndex].quantity = req.body.quantity;
    await Cart.findOneAndUpdate(
      { user: req.params.id },
      {
        items: findItemInCart.items,
      },
      (error, data) => {
        if (error) {
          res.status(400).json({ msg: "Some Error Occured", error });
        } else {
          res.status(200).json({ msg: "Item Updated SuccessFully!" });
        }
      }
    );
  } else {
    res.status(400).json({ msg: "No Item Found!" });
  }
});

// @route   Delete api/carts/Delete
// @desc    Delete user cart Item
// @access  Public
router.delete("/deleteCartItem/:id", async (req, res) => {
  let findItemInCart = await Cart.findOne({ user: req.params.id });
  if (findItemInCart) {
    let newCart = findItemInCart.items.filter(
      (item) => item.bookName != req.body.bookName
    );
    await Cart.findOneAndUpdate(
      { user: req.params.id },
      {
        items: newCart,
      },
      (error, data) => {
        if (error) {
          res.status(400).json({ msg: "Some Error Occured", error });
        } else {
          res.status(200).json({ msg: "Item Deleted SuccessFully!" });
        }
      }
    );
  } else {
    res.status(400).json({ msg: "No Item Found!" });
  }
});

// @route   POST api/carts/:id/addBook/:isbn
// @desc    Add a book to shopping cart
// @access  Public
router.post("/:cartId/addBook/:bookISBN", (req, res) => {
  Book.find({ isbn: req.params.bookISBN }, function (err, book) {
    if (err) res.status(404).json({ msg: "Sorry! Book not found" });
    else {
      Cart.findOneAndUpdate(req.params.cartID, {
        $inc: { quantity: 1 },
        $push: {
          items: {
            book,
          },
        },
      })
        .then((cart) => res.json(cart))
        .catch((err) => res.status(404).json({ msg: "Sorry! Book not found" }));
    }
  });
});

// @router  DELETE api/carts/:cartId/deleteBook/:bookISBN
// @desc    Delete a cart #TODO: Change to delete a single book
// @access  Public
router.delete("/:cartId/deleteBook/:bookISBN", (req, res) => {
  Book.find({ isbn: req.params.bookISBN }, function (err, book) {
    if (err) res.status(404).json({ msg: "Sorry! Book not found" });
    else {
      Cart.findOneAndDelete(req.params.cartID, {
        //$inc: { quantity: 1 },
        $pull: {
          items: {
            book,
          },
        },
      })

        .then((cart) => res.json(cart))
        .catch((err) => res.status(404).json({ msg: "Sorry! Book not found" }));
    }
  });
});

// @router  GET api/carts/
// @desc    Get all carts
// @access  Public
router.get("/", (req, res) => {
  Cart.find()
    .sort({ date: -1 })
    .then((carts) => res.json(carts))
    .catch();
});

module.exports = router;
