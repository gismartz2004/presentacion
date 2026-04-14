const { db: prisma } = require("../../../lib/prisma");

exports.getHomeHero = async (req, res) => {
  try {
    const { lang } = req.query;
    const hero = await prisma.home_hero.findFirst({
      where: { lang },
    });
    res.status(200).json(hero);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el Hero" });
  }
};

exports.createHomeHero = async (req, res) => {
  try {
    const { title, description, nameLink, images, lang, link_women, link_men, backgroundType, videoUrl } = req.body;
    const hero = await prisma.home_hero.create({
      data: { title, description, nameLink, images, lang, link_women, link_men, backgroundType, videoUrl },
    });
    res.status(201).json({
      code: 201,
      message: "Hero creado exitosamente",
      data: hero,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: 500,
      message: "Error al crear el Hero",
      error: error.message,
    });
  }
};

exports.updateHomeHero = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, nameLink, images, lang, link_women, link_men, backgroundType, videoUrl } = req.body;

    const hero = await prisma.home_hero.update({
      where: { id: parseInt(id) },
      data: { title, description, nameLink, images, lang, link_women, link_men, backgroundType, videoUrl },
    });

    res.status(200).json({
      code: 200,
      message: "Hero actualizado exitosamente",
      data: hero,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: 500,
      message: "Error al actualizar el Hero",
      error: error.message,
    });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { featured: true, isDeleted: false },
      take: 10,
    });
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener productos destacados" });
  }
};
