'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Rocket } from 'lucide-react';

const formSchema = z.object({
  topic: z.string(),
  numQuestions: z.coerce.number().min(3).max(10),
  timer: z.coerce.number().min(5).max(60),
});

export type QuizSetupFormValues = z.infer<typeof formSchema>;

const topics = [
  { value: 'lore', label: 'Lore' },
  { value: 'locations', label: 'Lieux d\'intérêt' },
  { value: 'resources', label: 'Ressources' },
  { value: 'ships', label: 'Vaisseaux' },
  { value: 'organizations', label: 'Organisations' },
];

const timers = [
    { value: 10, label: '10 secondes' },
    { value: 15, label: '15 secondes' },
    { value: 20, label: '20 secondes' },
    { value: 30, label: '30 secondes' },
]

interface QuizSetupFormProps {
  onSubmit: (values: QuizSetupFormValues) => void;
  isLoading: boolean;
}

export function QuizSetupForm({ onSubmit, isLoading }: QuizSetupFormProps) {
  const form = useForm<QuizSetupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: 'lore',
      numQuestions: 5,
      timer: 15,
    },
  });

  return (
    <Card className="border-primary/20 shadow-lg shadow-primary/10">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl md:text-5xl font-headline tracking-wider text-primary">POLYQUIZ</CardTitle>
        <CardDescription className="text-foreground/80 pt-2">
          Testez vos connaissances de l'univers de Star Citizen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sujet</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un sujet" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic.value} value={topic.value}>
                          {topic.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numQuestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de questions</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le nombre de questions" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[3, 5, 10].map((num) => (
                        <SelectItem key={num} value={String(num)}>
                          {num} Questions
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temps par question</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le temps par question" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timers.map((timer) => (
                        <SelectItem key={timer.value} value={String(timer.value)}>
                          {timer.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Génération du quiz...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-5 w-5" />
                  Démarrer le quiz
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
