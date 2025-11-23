<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php echo e(config('app.name', 'Newspaper Management System')); ?></title>
    <?php echo app('Illuminate\Foundation\Vite')(['resources/js/main.jsx']); ?>
</head>
<body>
    <div id="app"></div>
</body>
</html>

<?php /**PATH C:\Users\HP R\Newspaper\resources\views/app.blade.php ENDPATH**/ ?>