import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import { CalibrationService } from '../../services/calibrationService';

interface CalibrationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (distance: number) => void;
  pixelDistance?: number;
}

const CalibrationDialog: React.FC<CalibrationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  pixelDistance = 0
}) => {
  const [distance, setDistance] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleConfirm = () => {
    const numDistance = parseFloat(distance);
    
    if (isNaN(numDistance) || numDistance <= 0) {
      setError('Please enter a valid distance greater than 0');
      return;
    }

    // Distance is already in feet
    onConfirm(numDistance);
    handleClose();
  };

  const handleClose = () => {
    setDistance('');
    setError('');
    onClose();
  };

  const handleDistanceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDistance(event.target.value);
    setError(''); // Clear error when user starts typing
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SquareFootIcon sx={{ mr: 1 }} />
          Set Real-World Distance
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            You've drawn a calibration line of <strong>{Math.round(pixelDistance)} pixels</strong>.
            Please enter the real-world distance this line represents.
          </Typography>
        </Box>

        <TextField
          label="Distance (feet)"
          value={distance}
          onChange={handleDistanceChange}
          type="number"
          inputProps={{
            min: 0,
            step: 0.1,
            placeholder: "e.g. 10"
          }}
          fullWidth
          autoFocus
          error={!!error}
          helperText={error}
          sx={{ mb: 2 }}
        />

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Tip:</strong> For best accuracy, measure a known distance like:
          </Typography>
          <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
            <li>Building width or length</li>
            <li>Road width</li>
            <li>Parking space length</li>
            <li>Sports field dimensions</li>
          </Box>
        </Alert>

        {distance && !error && (
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Preview:</strong>
            </Typography>
            <Typography variant="body2">
              {pixelDistance} pixels = {distance} feet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Scale: {(pixelDistance / parseFloat(distance || '1')).toFixed(2)} pixels per foot
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained"
          disabled={!distance || !!error}
        >
          Set Distance
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CalibrationDialog;
