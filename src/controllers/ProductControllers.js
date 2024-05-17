import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    try {
      cb(null, "public/images");
    } catch (error) {
      cb(error, null);
    }
  },
  filename: function (req, file, cb) {
    const fileName = `${file.fieldname}_${Date.now()}${path.extname(
      file.originalname
    )}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage,
  limits: {
    fieldSize: 5000000,
  },
  fileFilter: function (req, file, cb) {
    const allowedFileTypes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Tipe file tidak valid, hanya jpeg, jpg, png dan webp yang diperbolehkan"
        ),
        false
      );
    }
  },
}).single("product");

export const getProducts = async (req, res) => {
  try {
    BigInt.prototype.toJSON = function () {
      const int = Number.parseInt(this.toString());
      return int ?? this.toString();
    };

    const page = parseInt(req.query.page) || 0;

    const limit = parseInt(req.query.limit) || 9;

    const search = req.query.search_query || "";

    const offset = limit * page;

    const totalRows = await prisma.product.count({
      where: {
        nama: {
          contains: search,
        },
      },
    });

    const totalPage = Math.ceil(totalRows / limit);

    const results = await prisma.product.findMany({
      where: {
        nama: {
          contains: search,
        },
      },
      skip: offset,
      take: limit,
      orderBy: {
        nama: "asc",
      },
    });

    res.status(200).json({
      results,
      page,
      limit,
      totalRows,
      totalPage,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const createProduct = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          status: "error",
          message: `Multer Error: ${err.message}`,
        });
      } else {
        return res.status(400).json({
          status: "error",
          message: `File Upload Invalid: ${err.message}`,
        });
      }
    }

    BigInt.prototype.toJSON = function () {
      const int = Number.parseInt(this.toString());
      return int ?? this.toString();
    };

    const { nama, deskripsi, kontak, alamat } = req.body;
    const product = req.file ? req.file.filename : null;

    if (!product) {
      return res.status(400).json({
        status: "error",
        message: "Tidak ada file yang diupload",
      });
    }

    const urlToImage = `${req.protocol}://${req.get("host")}/static/images/${
      req.file.filename
    }`;

    try {
      const newProduct = await prisma.product.create({
        data: {
          nama,
          deskripsi,
          kontak,
          alamat,
          image: product,
          urlToImage,
        },
      });
      res.status(201).json({
        status: "success",
        message: "Produk Berhasil Dibuat",
        data: newProduct,
      });
    } catch (error) {
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path); // Remove the uploaded file if there's an error
      }
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  });
};
