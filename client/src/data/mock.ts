export const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "password123"
};

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  stock: number;
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Estantería Minimalista Oak",
    category: "Anaqueles",
    price: 450,
    image: "https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&q=80&w=800",
    stock: 12
  },
  {
    id: 2,
    name: "Grifo de Cocina Industrial Matte",
    category: "Detalles Hogar",
    price: 320,
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
    stock: 15
  },
  {
    id: 3,
    name: "Cerradura Digital Biométrica",
    category: "Detalles Hogar",
    price: 280,
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800",
    stock: 8
  },
  {
    id: 4,
    name: "Silla Comedor Viena",
    category: "Juegos de Comedor",
    price: 180,
    image: "https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&q=80&w=800",
    stock: 24
  },
  {
    id: 5,
    name: "Set Grifería Baño Cobre",
    category: "Detalles Hogar",
    price: 450,
    image: "https://images.unsplash.com/photo-1620626011761-9963d7521476?auto=format&fit=crop&q=80&w=800",
    stock: 10
  },
  {
    id: 6,
    name: "Juego Comedor Nordic",
    category: "Juegos de Comedor",
    price: 1200,
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&q=80&w=800",
    stock: 3
  }
];

export const SALES_DATA = [
  { month: "Ene", sales: 4500 },
  { month: "Feb", sales: 5200 },
  { month: "Mar", sales: 4800 },
  { month: "Abr", sales: 6100 },
  { month: "May", sales: 5900 },
  { month: "Jun", sales: 7500 },
];
