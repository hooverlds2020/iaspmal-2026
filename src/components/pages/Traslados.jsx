import React from 'react';
import InfoViajePage from './InfoViajePage';

const Traslados = () => (
  <InfoViajePage
    intro="El aeropuerto más cercano a San Cristóbal de las Casas es el Aeropuerto Internacional Ángel Albino Corzo, ubicado en la zona de Tuxtla Gutiérrez / Chiapa de Corzo. El traslado del aeropuerto a San Cristóbal suele tomar aproximadamente una hora y media, dependiendo del tráfico, el clima y el horario de llegada."
    blocks={[
      {
        heading: 'Alternativas de traslado',
        list: [
          'Taxis directos desde el aeropuerto',
          'Taxis compartidos, que pueden organizarse entre varias personas para dividir costos',
          'Vans o transportes colectivos hacia San Cristóbal',
        ],
      },
      {
        highlight: 'Ninguna de estas contrataciones se hace por adelantado. Son transportes que están disponibles a la llegada de los vuelos. De todos modos, desde la organización del congreso veremos la posibilidad de que haya unas Vans privadas en los horarios en que lleguen más personas, con costo más o menos equivalente al transporte colectivo habitual, pero sólo para la comunidad IASPM-AL.',
      },
    ]}
  />
);

export default Traslados;
