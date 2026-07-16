import CatalogCrudPage from 'pages/catalog/CatalogCrudPage';
import { brandService } from 'services/brandService';

export default function BrandsPage() {
  return <CatalogCrudPage title="Marcas" singular="marca" swrKey="/brands" service={brandService} />;
}
