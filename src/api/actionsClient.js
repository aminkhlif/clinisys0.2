// src/api/actionsClient.js
import axiosClient from './axiosClient.js';

export const listerActions = (imageId) =>
  axiosClient.get('/actions', { params: { imageId } }).then((res) => res.data);

export const creerAction = (action) =>
  axiosClient.post('/actions', action).then((res) => res.data);

export const modifierAction = (actionId, action) =>
  axiosClient.put(`/actions/${actionId}`, action).then((res) => res.data);

export const supprimerAction = (actionId) =>
  axiosClient.delete(`/actions/${actionId}`);

export const validerActions = (imageId) =>
  axiosClient.post(`/actions/images/${imageId}/valider`);

export const annulerActions = (imageId) =>
  axiosClient.delete(`/actions/images/${imageId}/annuler`);