import { MEALS, type Meal } from '../../data/meals';
import { getPassengerName } from '../../state/bookingReducer';
import { useBooking } from '../../state/useBooking';
import { cx } from '../../utils/classNames';
import { formatPrice } from '../../utils/formatCurrency';
import { Panel } from '../ui/Panel';
import styles from './MealSelector.module.css';

interface MealOptionProps {
  name: string;
  meal: Meal | null;
  checked: boolean;
  onSelect: () => void;
}

function MealOption({ name, meal, checked, onSelect }: MealOptionProps) {
  return (
    <label className={cx(styles.option, checked && styles.optionChecked)}>
      <input type="radio" name={name} checked={checked} onChange={onSelect} className="visually-hidden" />
      {meal ? (
        <span
          className={cx(styles.diet, meal.diet === 'veg' ? styles.veg : styles.nonVeg)}
          title={meal.diet === 'veg' ? 'Vegetarian' : 'Non-vegetarian'}
        >
          <span className="visually-hidden">{meal.diet === 'veg' ? 'Vegetarian' : 'Non-vegetarian'}</span>
        </span>
      ) : (
        <span className={styles.dietPlaceholder} aria-hidden="true" />
      )}
      <span className={styles.optionBody}>
        <span className={styles.optionName}>{meal ? meal.name : 'No meal'}</span>
        <span className={styles.optionDescription}>
          {meal ? meal.description : 'Skip the meal for this passenger'}
        </span>
      </span>
      <span className={cx(styles.optionPrice, meal?.price === 0 && styles.freePrice)}>
        {meal ? formatPrice(meal.price) : '—'}
      </span>
    </label>
  );
}

/** Bonus feature: one meal per passenger, for the currently selected passenger. */
export function MealSelector() {
  const { state, dispatch, activePassenger } = useBooking();
  const selectedMealId = state.mealByPassenger[activePassenger.id] ?? null;
  const groupName = `meal-${activePassenger.id}`;

  function select(mealId: string | null) {
    dispatch({ type: 'SELECT_MEAL', passengerId: activePassenger.id, mealId });
  }

  return (
    <Panel
      title={`Meal for ${getPassengerName(activePassenger)}`}
      subtitle="Optional · one meal per passenger · switch passenger above to change theirs"
    >
      <fieldset className={styles.options}>
        <legend className="visually-hidden">Meal for {getPassengerName(activePassenger)}</legend>
        <MealOption name={groupName} meal={null} checked={selectedMealId === null} onSelect={() => select(null)} />
        {MEALS.map((meal) => (
          <MealOption
            key={meal.id}
            name={groupName}
            meal={meal}
            checked={selectedMealId === meal.id}
            onSelect={() => select(meal.id)}
          />
        ))}
      </fieldset>
    </Panel>
  );
}
