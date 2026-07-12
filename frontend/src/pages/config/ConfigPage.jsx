import { useState } from 'react';

import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import MainCard from 'components/cards/MainCard';
import CompanySection from './components/CompanySection';
import UsersSection from './components/UsersSection';
import BranchesSection from './components/BranchesSection';

export default function ConfigPage() {
  const [tab, setTab] = useState(0);

  return (
    <Stack spacing={2}>
      <MainCard>
        <Typography variant="h3">Configuración</Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 2 }}>
          <Tab label="Empresa" />
          <Tab label="Usuarios" />
          <Tab label="Sucursales" />
        </Tabs>
      </MainCard>

      {tab === 0 && <CompanySection />}
      {tab === 1 && <UsersSection />}
      {tab === 2 && <BranchesSection />}
    </Stack>
  );
}
