# Product Catalog REST API

This is a RESTful API for managing a product catalog. It allows users to perform CRUD operations on product items including creation, retrieval, updating, and deletion of product data. The API is built using **Node.js**, **Express.js**, and **MongoDB** with **Mongoose**.

---

## Tech Stack

* **Backend**: Node.js, Express.js
* **Database**: MongoDB with Mongoose ODM
* **Testing**: Postman
* **Tools**: Nodemon, dotenv

---

## Folder Structure

```
product-catalog-api/
├── src/
│   ├── controllers/       # Route handlers
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── docs/              # API documentation & collections
│   └── config/            # DB connection
├── .env                   # Environment variables
├── .gitignore
├── package.json
├── server.js
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/kkarangwa/product-catalog-api.git
cd product-catalog-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory with the following content:

```
PORT=5000
MONGO_URI=mongodb+srv://<your_mongo_uri>
```

Replace `<your_mongo_uri>` with your actual MongoDB connection string.

### 4. Run the server

```bash
# For development
npm run dev

# For production
npm start
```

---

## API Endpoints

Base URL: `http://localhost:5000/api/products`

| Method | Endpoint | Description             |
| ------ | -------- | ----------------------- |
| GET    | `/`      | Get all products        |
| GET    | `/:id`   | Get a single product    |
| POST   | `/`      | Create a new product    |
| PUT    | `/:id`   | Update an existing item |
| DELETE | `/:id`   | Delete a product        |

---

##  Example Product Object

```json
{
  "name": "Bluetooth Speaker",
  "description": "Portable wireless speaker with HD sound",
  "price": 49.99,
  "inStock": true
}
```

---

##  API Testing With Postman

1. Make sure your server is running: `npm run dev`
2. Open [Postman](https://www.postman.com/)
3. Import the collection: `src/docs/product-catalog.postman_collection.json`
4. Use the pre-made requests to test all endpoints
5. Ensure MongoDB is connected to see actual results

---

##  Project Highlights

* Clean modular folder structure
* Middleware handling for errors and JSON parsing
* Centralized MongoDB connection logic
* Scalability-ready for larger projects
* CRUD operations for product items

---

##  Sample `.env`

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/product_catalog_db
```

---

##  Scripts

```bash
npm run dev      # Starts development server with nodemon
npm start        # Starts production server
```

---

## Documentation

Find the API documentation and Postman collection in:

```
src/docs/product-catalog.postman_collection.json
```

---

##  Author

**Kethia**
Multi-disciplinary creative | Business Associate | Developer

> Built with ❤️ & attention to detail.

---

## License

This project is open source and available under the [MIT License](LICENSE).
