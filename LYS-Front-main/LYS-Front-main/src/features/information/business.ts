import {getOperations,subscribeOperations} from '../operations/operationsStore';
export const business = {
  name: 'Leñas y Sabores',
  address: 'C. Turístico Los Palomares Mz. D Lt. 5',
  reference: 'Frente a la Planta Eléctrica San Benito',
  district: 'Carabayllo, Lima, Perú',
  phone: '947 540 597',
  email: 'ventas@lenasysabores.store',
  hours: '12 m. – 11 p. m.',
  whatsapp: 'https://wa.me/51947540597',
  mapSearch: 'https://www.openstreetmap.org/search?query=' + encodeURIComponent('Los Palomares, San Benito, Carabayllo, Perú'),
};

function refreshBusiness(){const settings=getOperations().settings;business.name=settings.name;business.phone=settings.phone;business.email=settings.email;business.hours=settings.hours;if(settings.address!=="C. Turístico Los Palomares Mz. D Lt. 5, frente a la Planta Eléctrica San Benito, Carabayllo")business.address=settings.address;business.whatsapp='https://wa.me/51'+settings.phone.replace(/\D/g,'');}
refreshBusiness();subscribeOperations(refreshBusiness);
