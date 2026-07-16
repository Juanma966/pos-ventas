import CatalogCrudPage from 'pages/catalog/CatalogCrudPage';
import { categoryService } from 'services/categoryService';

export default function CategoriesPage() {
  return <CatalogCrudPage title="Categorías" singular="categoría" swrKey="/categories" service={categoryService} />;
}
