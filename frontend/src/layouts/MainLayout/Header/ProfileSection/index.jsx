import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import MainCard from 'components/cards/MainCard';
import Transitions from 'components/extended/Transitions';
import useConfig from 'hooks/useConfig';
import useAuth from 'hooks/useAuth';
import ProfileModal from './ProfileModal';

import { IconLogout, IconSettings, IconUser } from '@tabler/icons-react';

export default function ProfileSection() {
  const theme = useTheme();
  const { borderRadius } = useConfig();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleToggle = () => setOpen((prev) => !prev);

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const openProfile = () => {
    setOpen(false);
    setProfileOpen(true);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) anchorRef.current?.focus();
    prevOpen.current = open;
  }, [open]);

  return (
    <>
      <Chip
        sx={{
          ml: 2,
          height: '48px',
          alignItems: 'center',
          borderRadius: '27px',
          '& .MuiChip-label': { lineHeight: 0, px: 1.5 }
        }}
        icon={
          user?.avatar ? (
            <Avatar src={user.avatar} alt={user?.name} sx={{ ...theme.typography.mediumAvatar, margin: '8px 0 8px 8px !important', cursor: 'pointer' }} />
          ) : undefined
        }
        label={<IconSettings stroke={1.5} size="24px" />}
        ref={anchorRef}
        aria-controls={open ? 'profile-menu' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        color="primary"
        aria-label="perfil de usuario"
      />
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[{ name: 'offset', options: { offset: [0, 14] } }]}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions in={open} {...TransitionProps}>
              <Paper>
                {open && (
                  <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                    <Box sx={{ p: 2, pb: 0 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar src={user?.avatar || undefined} sx={{ width: 44, height: 44 }}>
                          {(user?.name || 'U').charAt(0).toUpperCase()}
                        </Avatar>
                        <Stack spacing={0.25}>
                          <Typography variant="h4">{user?.name || 'Usuario'}</Typography>
                          <Typography variant="subtitle2" color="text.secondary">
                            {user?.role || 'Sin rol'}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Divider sx={{ mt: 2 }} />
                    </Box>
                    <Box sx={{ p: 2, py: 0 }}>
                      <List
                        component="nav"
                        sx={{
                          width: '100%',
                          minWidth: 220,
                          borderRadius: `${borderRadius}px`,
                          '& .MuiListItemButton-root': { mt: 0.5 }
                        }}
                      >
                        <ListItemButton sx={{ borderRadius: `${borderRadius}px` }} onClick={openProfile}>
                          <ListItemIcon>
                            <IconUser stroke={1.5} size="20px" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">Mi perfil</Typography>} />
                        </ListItemButton>
                        <Divider sx={{ my: 1 }} />
                        <ListItemButton sx={{ borderRadius: `${borderRadius}px` }} onClick={handleLogout}>
                          <ListItemIcon>
                            <IconLogout stroke={1.5} size="20px" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">Cerrar sesión</Typography>} />
                        </ListItemButton>
                      </List>
                    </Box>
                  </MainCard>
                )}
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
