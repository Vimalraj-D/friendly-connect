import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Category } from '@/types/database';
import catChefWear from '@/assets/cat-chef-wear.png';
import catKidsWear from '@/assets/cat-kids-wear.png';
import catKitchenWear from '@/assets/cat-kitchen-wear.png';
interface CategoryCardProps {
  category: Category;
  index?: number;
}

const PALETTES = [
  { bg: 'from-[hsl(350_85%_82%)] to-[hsl(350_85%_72%)]', text: 'text-white' },
  { bg: 'from-[hsl(36_95%_72%)] to-[hsl(36_95%_60%)]', text: 'text-white' },
  { bg: 'from-[hsl(18_15%_75%)] to-[hsl(18_10%_55%)]', text: 'text-white' },
  { bg: 'from-[hsl(25_45%_65%)] to-[hsl(25_45%_45%)]', text: 'text-white' },
];
function pickImage(name: string): string | null {
  const n = name.toLowerCase();
  if (n.includes('kid')) return catKidsWear;
  if (n.includes('chef')) return catChefWear;
  if (n.includes('kitchen')) return catKitchenWear;
  return null;
}
export function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  const palette = PALETTES[index % PALETTES.length];
  const src = pickImage(category.name) || category.image_url || '/placeholder.svg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link
        to={`/products?category=${category.id}`}
        className={`relative block h-32 md:h-36 rounded-full bg-gradient-to-br ${palette.bg} shadow-[0_15px_40px_-10px_hsl(8_60%_30%/0.35)] overflow-visible transition-all duration-500 hover:shadow-[0_25px_60px_-15px_hsl(8_60%_30%/0.5)] mt-20`}
      >
        {/* Soft inner glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 via-transparent to-white/10 pointer-events-none" />

        {/* Text label on left */}
        <div className="absolute inset-y-0 left-6 md:left-8 flex flex-col justify-center z-10 max-w-[55%]">
          <h3 className={`text-base md:text-xl font-display font-bold ${palette.text} leading-tight drop-shadow-sm`}>
            {category.name}
          </h3>
          <span className="mt-3 inline-flex w-fit items-center px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-white text-foreground rounded-full shadow-md group-hover:scale-105 transition-transform">
            Click Now
          </span>
        </div>

        {/* Pop-out image — overflowing the pill */}
        <motion.div
          initial={{ scale: 0.9 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          className="absolute right-0 -top-20 bottom-0 w-[55%] flex items-end justify-end pr-2 pointer-events-none"
        >
          <img
            src={src}
            alt={category.name}
            className="h-auto max-h-[230px] w-auto object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.25)] transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2"
            style={{ filter: 'drop-shadow(0 20px 30px rgba(80,30,20,0.35))' }}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}
