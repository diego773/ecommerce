const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', (req, res) => {
  // find all tags
  // be sure to include its associated Product data
    try {
    const tagData = await Tag.findAll();
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }

});

router.get('/:id', (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
    try {
    const tagData = await Tag.findByPk(req.params.id, {
      // JOIN with ProductTag, using the Tag through table
      include: [{ model: ProductTag, through: Tag, as: 'product_tag' }]
    });

    if (!tagData) {
      res.status(404).json({ message: 'No tags found with this id!' });
      return;
    }

    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }

});

router.post('/', (req, res) => {
  // create a new tag
    try {
    const tagData = await Tag.create(req.body);
    res.status(200).json(tagData);
  } catch (err) {
    res.status(400).json(err);
  }

});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
  // update product data
Tag.update(req.body, {
  where: {
    id: req.params.id,
  },
})
  .then((tag) => {
    // find all associated tags from Product
    return Product.findAll({ where: { product_id: req.params.id } });
  })
  .then((product) => {
    // get list of current tag_ids
    const productIds = product.map(({ tag_id }) => tag_id);
    // create filtered list of new tag_ids
    const newProduct = req.body.tagIds
      .filter((tag_id) => !productIds.includes(tag_id))
      .map((tag_id) => {
        return {
          product_id: req.params.id,
          tag_id,
        };
      });
    // figure out which ones to remove
    const productToRemove = product
      .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
      .map(({ id }) => id);

    // run both actions
    return Promise.all([
      Product.destroy({ where: { id: producToRemove } }),
      Product.bulkCreate(newProduct),
    ]);
  })
  .then((updatedProduct) => res.json(updatedProduct))
  .catch((err) => {
    // console.log(err);
    res.status(400).json(err);
  });

});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
    try {
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!tagData) {
      res.status(404).json({ message: 'No tag found with this id!' });
      return;
    }

    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }

});

module.exports = router;
