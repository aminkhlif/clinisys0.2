// src/components/image/ImageGrid.jsx
import { Grid } from '@mui/material';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, rectSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { useSnackbar } from 'notistack';
import ImageCard from './ImageCard.jsx';
import axiosClient from '../../api/axiosClient.js';

function ImageGrid({ images, selectionnees, onChangerSelection, onReordonne, onOuvrirDetail, onOuvrirActions }) {
  const { enqueueSnackbar } = useSnackbar();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const basculerSelection = (imageId) => {
    if (selectionnees.includes(imageId)) {
      onChangerSelection(selectionnees.filter((id) => id !== imageId));
    } else {
      onChangerSelection([...selectionnees, imageId]);
    }
  };

  const gererFinDrag = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const ancienIndex = images.findIndex((img) => img.id === active.id);
    const nouvelIndex = images.findIndex((img) => img.id === over.id);
    const nouvelOrdre = arrayMove(images, ancienIndex, nouvelIndex);

    onReordonne(nouvelOrdre);

    try {
      const payload = nouvelOrdre.map((img, index) => ({ imageId: img.id, nouvelOrdre: index }));
      await axiosClient.patch('/images/reordonner', payload);
    } catch {
      enqueueSnackbar("Le réordonnancement n'a pas pu être enregistré", { variant: 'error' });
      onReordonne(images);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={gererFinDrag}>
      <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
        <Grid container spacing={2}>
          {images.map((image) => (
            <Grid key={image.id} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }}>
              <ImageCard
                image={image}
                selectionnee={selectionnees.includes(image.id)}
                onBasculerSelection={() => basculerSelection(image.id)}
                onOuvrirDetail={() => onOuvrirDetail(image)}
                onOuvrirActions={() => onOuvrirActions(image)}
              />
            </Grid>
          ))}
        </Grid>
      </SortableContext>
    </DndContext>
  );
}

export default ImageGrid;