import imageLazyLoad from '../method/image-lazyload';
import slider from '../method/slider';

const methods = {
    methods: {
        forceImageLoad: imageLazyLoad.methods.forceImageLoad,
        initImageLazyLoad: imageLazyLoad.methods.initImageLazyLoad,
        initSlider: slider.methods.initSlider
    }
};

export default methods;
