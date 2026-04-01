// A utility to provide fun, creative comparisons for fitness data

export const getWeightMetaphor = (weightKg) => {
    if (!weightKg) return '';
    const num = parseFloat(weightKg);

    // Fun real-life object comparisons
    if (num <= 5) return 'Like lifting a healthy housecat 🐈';
    if (num <= 10) return 'Like lifting a medium bowling ball 🎳';
    if (num <= 20) return 'Like lifting a microwave oven 📟';
    if (num <= 30) return 'Like lifting a Dalmatian dog 🐕';
    if (num <= 50) return 'Like lifting a baby hippo 🦛';
    if (num <= 75) return 'Like lifting a typical adult kangaroo 🦘';
    if (num <= 100) return 'Like lifting a newborn elephant 🐘';
    if (num <= 150) return 'Like lifting a giant panda 🐼';
    if (num <= 200) return 'Like lifting an adult male lion 🦁';
    return 'Like lifting a small car! 🚗';
};

export const getCalorieMetaphor = (calories) => {
    if (!calories) return '';
    const num = parseFloat(calories);

    // Fun food comparisons
    if (num <= 50) return 'Equal to a crisp green apple 🍏';
    if (num <= 150) return 'Equal to a scoop of vanilla ice cream 🍦';
    if (num <= 300) return 'Equal to a glazed donut 🍩';
    if (num <= 500) return 'Equal to a large slice of chocolate cake 🍰';
    if (num <= 800) return 'Equal to a fully loaded burger 🍔';
    if (num <= 1200) return 'Equal to an entire large pizza 🍕';
    return 'Equal to a Thanksgiving feast 🦃';
};

export const getRepMetaphor = (reps) => {
    if (!reps) return '';
    const num = parseInt(reps, 10);

    if (num <= 5) return 'Raw power 💥';
    if (num <= 10) return 'Muscle builder 💪';
    if (num <= 15) return 'Hypertrophy zone 🔥';
    if (num <= 20) return 'Endurance marathon 🏃‍♂️';
    return 'Absolute insanity 🤯';
};
