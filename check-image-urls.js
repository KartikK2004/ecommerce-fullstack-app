
const pool = require("./config/db");

async function checkImages() {
  try {
    const [products] = await pool.query(
      "SELECT id, name, image_url FROM products ORDER BY id"
    );

    console.log(`Checking ${products.length} product images...\n`);

    for (const product of products) {
      try {
        const response = await fetch(product.image_url, {
          method: "HEAD",
          signal: AbortSignal.timeout(10000),
        });

        const type = response.headers.get("content-type") || "";
        const working = response.ok && type.includes("image/");

        console.log(
          `${working ? "OK" : "CHECK"} | ${product.id} | ${product.name} | ${response.status} | ${product.image_url}`
        );
      } catch (error) {
        console.log(
          `CHECK | ${product.id} | ${product.name} | ${error.message} | ${product.image_url}`
        );
      }
    }
  } catch (error) {
    console.error("Database error:", error.message);
  } finally {
    await pool.end();
  }
}

checkImages();
