const postgres = require("./postgres");
const common = require("./common");

module.exports = {
  getCategories: function (isFrench, callback) {
    var sql = `SELECT trim(s.token) as category FROM public.tbl_211_raw t, unnest(string_to_array(t.cwd_simcategory_headinggroups, ';')) s(token) group by trim(s.token) order by trim(s.token)`;
    if (isFrench === "true")
      sql = `SELECT trim(s.token) as category FROM public.tbl_211_french_raw t, unnest(string_to_array(t.cwd_simcategory_headinggroups, ';')) s(token) group by trim(s.token) order by trim(s.token)`;

    const pg = new postgres({ dbName: "tabular" });
    pg.selectAll(sql, (result) => {
      let categories = [];
      result.forEach((category) => {
        categories.push(category.category);
      });
      callback(categories);
    });
  },

  getSubCategories: function (category, isFrench, callback) {
    var sql = `SELECT trim(s.token) as sub_category FROM public.tbl_211_raw t, unnest(string_to_array(t.cwd_simcategory_headings, ';')) s(token) where cwd_simcategory_headinggroups ilike '%' || $1 || '%' group by trim(s.token) order by trim(s.token)`;
    if (isFrench === "true")
      sql = `SELECT trim(s.token) as sub_category FROM public.tbl_211_french_raw t, unnest(string_to_array(t.cwd_simcategory_headings, ';')) s(token) where cwd_simcategory_headinggroups ilike '%' || $1 || '%' group by trim(s.token) order by trim(s.token)`;
    var values =[category];
    const pg = new postgres({ dbName: "tabular" });
    pg.selectAllWithValues(sql, values, (result) => {
      let categories = [];
      result.forEach((category) => {
        categories.push(category.sub_category);
      });
      callback(categories);
    });
  },

  getResults: function (category, subCategory, age, isFrench, callback) {
    if (category === "All") category = "";
    if (subCategory === "All") subCategory = "";
    if (age === "All") age = "";

    var sql;
    sql = `SELECT * FROM public.tbl_211_raw  where latitude <> '' and map_record <> 'Do Not Map' and cwd_simcategory_headinggroups ilike '%' || $1 || '%' and cwd_simcategory_headings ilike '%' || $2 || '%' and age_category ilike '%' || $3 || '%' ;`;
    if (isFrench === "true")
      sql = `SELECT * FROM public.tbl_211_french_raw  where latitude <> '' and map_record <> 'Do Not Map' and cwd_simcategory_headinggroups ilike '%' || $1 || '%' and cwd_simcategory_headings ilike '%' || $2 || '%' and age_category ilike '%' || $3 || '%' ;`;
    var values =[category, subCategory,age];
    const pg = new postgres({ dbName: "tabular" });
    pg.selectAllWithValues(sql,values, (result) => {
      callback(result);
    });
  },
};
