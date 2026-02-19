const fs = require("fs");
const csv = require("csv-parser");

const results = [];
fs.createReadStream("products2.csv")
  .pipe(
    csv({
      separator: ";",
      headers: [
        "id",
        "imageSrc",
        "name",
        "category",
        "designer",
        "set_name",
        "mime_type",
        "size",
        "creature_type",
        "weapon",
        "title",
        "grade",
        "approved",
      ],
    }),
  )
  .on("data", (data) => results.push(data))
  .on("end", () => {
    console.log("Results length:", results.length);
    if (results.length > 0) {
      console.log("First row:", results[0]);
    }
  })
  .on("error", (err) => console.error("Error:", err));
