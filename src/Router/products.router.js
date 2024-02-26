import { Router } from "express"
import { addProduct, deleteProduct, getProductById, getProducts, updateProduct } from "../controllers/products.controllers.js";
import { getFindParameters } from "../middlewares/products.middlewares.js";
import { authorization } from "../middlewares/auth.middlewares.js";
import passport from "passport";

const router = Router();

router.get("/", getFindParameters, getProducts);

router.get("/:pid", getProductById);

router.post("/", addProduct);


router.post("/", passport.authenticate("jwt", { session: false }), authorization(["admin", "premium"]), addProduct);

router.put("/:pid", passport.authenticate("jwt", { session: false }), authorization(["admin", "premium"]), updateProduct);

router.delete("/:pid", passport.authenticate("jwt", { session: false }), authorization(["admin", "premium"]), deleteProduct);

export default router;