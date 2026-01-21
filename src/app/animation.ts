import { AnimationController } from '@ionic/angular';

export const customEnterAnimation = (baseEl: HTMLElement) => {
    const animationCtrl = new AnimationController();
    const backdropAnimation = animationCtrl.create()
        .addElement(baseEl.querySelector('ion-backdrop')!)
        .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = animationCtrl.create()
        .addElement(baseEl.querySelector('.modal-wrapper')!)
        .keyframes([
            { offset: 0, opacity: '0', transform: 'scale(0.9)' },
            { offset: 1, opacity: '1', transform: 'scale(1)' }
        ])
        .duration(300)
        .easing('ease-out');

    return animationCtrl.create()
        .addElement(baseEl)
        .easing('ease-out')
        .duration(300)
        .addAnimation([backdropAnimation, wrapperAnimation]);
};

export const customLeaveAnimation = (baseEl: HTMLElement) => {
    const animationCtrl = new AnimationController();
    const backdropAnimation = animationCtrl.create()
        .addElement(baseEl.querySelector('ion-backdrop')!)
        .fromTo('opacity', 'var(--backdrop-opacity)', '0');

    const wrapperAnimation = animationCtrl.create()
        .addElement(baseEl.querySelector('.modal-wrapper')!)
        .keyframes([
            { offset: 0, opacity: '1', transform: 'scale(1)' },
            { offset: 1, opacity: '0', transform: 'scale(0.9)' }
        ])
        .duration(200)
        .easing('ease-in');

    return animationCtrl.create()
        .addElement(baseEl)
        .easing('ease-in')
        .duration(200)
        .addAnimation([backdropAnimation, wrapperAnimation]);
};
