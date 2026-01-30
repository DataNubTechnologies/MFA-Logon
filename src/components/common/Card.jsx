import './Card.css';

const Card = ({ 
  children, 
  title,
  subtitle,
  icon: Icon,
  action,
  variant = 'default',
  padding = 'default',
  className = '',
  ...props 
}) => {
  const cardClasses = [
    'card',
    `card-${variant}`,
    `card-padding-${padding}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} {...props}>
      {(title || action) && (
        <div className="card-header">
          <div className="card-header-left">
            {Icon && (
              <div className="card-icon">
                <Icon />
              </div>
            )}
            <div className="card-header-text">
              {title && <h3 className="card-title">{title}</h3>}
              {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="card-header-action">{action}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;
